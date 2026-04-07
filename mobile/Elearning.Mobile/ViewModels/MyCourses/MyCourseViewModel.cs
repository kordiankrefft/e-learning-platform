using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels.MyCourses;

public class MyCourseViewModel : INotifyPropertyChanged
{
    private readonly CourseService _coursesService;
    private readonly UserCourseEnrollmentService _enrollmentsService;
    private readonly UserCourseAccessService _accessesService;
    private readonly TokenService _tokenService;
    private readonly ModuleService _modulesService;
    private readonly QuizService _quizzesService;
    private readonly IssuedCertificateService _issuedCertificateService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            RaiseUiFlags();
        }
    }

    public bool IsNotBusy => !IsBusy;

    public string? Error
    {
        get => _error;
        set
        {
            if (_error == value) return;
            _error = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
            RaiseUiFlags();
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public List<MyCourseItemViewModel> ActiveItems { get; private set; } = [];
    public List<MyCourseItemViewModel> CompletedItems { get; private set; } = [];

    public bool ShowEmptyState => !IsBusy && !HasError && ActiveItems.Count == 0 && CompletedItems.Count == 0;
    public bool ShowActiveSection => ActiveItems.Count > 0;
    public bool ShowCompletedSection => CompletedItems.Count > 0;
    public bool ShowNoActiveText => !IsBusy && !HasError && ActiveItems.Count == 0 && CompletedItems.Count > 0;
    public bool ShowNoCompletedText => !IsBusy && !HasError && CompletedItems.Count == 0;

    public ICommand RefreshCommand { get; }
    public ICommand GoToLoginCommand { get; }
    public ICommand CompleteCourseCommand { get; }
    public ICommand OpenCourseCommand { get; }
    public ICommand DownloadCertificateCommand { get; }

    public MyCourseViewModel(
        CourseService coursesService,
        UserCourseEnrollmentService enrollmentsService,
        UserCourseAccessService accessesService,
        TokenService tokenService,
        ModuleService modulesService,
        QuizService quizzesService,
        IssuedCertificateService issuedCertificateService)
    {
        _coursesService = coursesService;
        _enrollmentsService = enrollmentsService;
        _accessesService = accessesService;
        _tokenService = tokenService;
        _modulesService = modulesService;
        _quizzesService = quizzesService;
        _issuedCertificateService = issuedCertificateService;

        RefreshCommand = new Command(async () => await LoadAsync());
        GoToLoginCommand = new Command(async () => await Shell.Current.GoToAsync("login"));

        OpenCourseCommand = new Command<MyCourseItemViewModel>(async item =>
        {
            if (item == null) return;
            await Shell.Current.GoToAsync($"modules?courseId={item.Enrollment.CourseId}");
        });

        CompleteCourseCommand = new Command<MyCourseItemViewModel>(async item =>
        {
            if (item == null || !item.CanComplete) return;
            await CompleteCourseAsync(item);
        });

        DownloadCertificateCommand = new Command<MyCourseItemViewModel>(async item =>
        {
            if (item == null) return;
            await DownloadCertificateAsync(item);
        });
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
        {
            ActiveItems = [];
            CompletedItems = [];
            RaiseAll();
            return;
        }

        try
        {
            IsBusy = true;
            Error = null;

            var coursesTask = _coursesService.GetAllAsync();
            var enrollTask = _enrollmentsService.GetMyAsync();
            var accessTask = _accessesService.GetMyAsync();

            await Task.WhenAll(coursesTask, enrollTask, accessTask);

            var courses = (coursesTask.Result ?? [])
                .Where(c => c.IsActive)
                .ToDictionary(c => c.Id);

            var accesses = (accessTask.Result ?? [])
                .GroupBy(a => a.CourseId)
                .ToDictionary(g => g.Key, g => g.FirstOrDefault());

            var enrollments = enrollTask.Result ?? [];

            ActiveItems = enrollments
                .Where(e => e.IsActive && e.Status != "Completed")
                .Select(e => new MyCourseItemViewModel(
                    e,
                    courses.GetValueOrDefault(e.CourseId),
                    accesses.GetValueOrDefault(e.CourseId)))
                .ToList();

            CompletedItems = enrollments
                .Where(e => e.IsActive && e.Status == "Completed")
                .Select(e => new MyCourseItemViewModel(
                    e,
                    courses.GetValueOrDefault(e.CourseId),
                    accesses.GetValueOrDefault(e.CourseId)))
                .ToList();

            RaiseAll();
            await CheckFinalQuizzesAsync(ActiveItems);
        }
        catch
        {
            Error = "Błąd ładowania moich kursów.";
        }
        finally
        {
            IsBusy = false;
            RaiseUiFlags();
        }
    }

    private async Task CheckFinalQuizzesAsync(List<MyCourseItemViewModel> items)
    {
        foreach (var item in items)
            item.PassedFinalQuiz = null;

        await Task.WhenAll(items.Select(async item =>
        {
            try
            {
                if (!item.HasAccess)
                {
                    item.PassedFinalQuiz = false;
                    return;
                }

                var modules = await _modulesService.GetCourseModulesAsync(item.Enrollment.CourseId);
                var last = modules?
                    .Where(m => m.IsActive)
                    .OrderBy(m => m.OrderIndex)
                    .LastOrDefault();

                if (last == null)
                {
                    item.PassedFinalQuiz = false;
                    return;
                }

                var quiz = await _quizzesService.GetModuleQuizAsync(last.Id);
                item.PassedFinalQuiz = quiz?.StudentPassed == true;
            }
            catch
            {
                item.PassedFinalQuiz = false;
            }
        }));
    }

    private async Task CompleteCourseAsync(MyCourseItemViewModel item)
    {
        try
        {
            item.IsCompleting = true;

            await _enrollmentsService.CompleteAsync(item.Enrollment.Id);

            item.MarkCompletedLocally();

            ActiveItems.Remove(item);
            CompletedItems.Insert(0, item);

            RaiseAll();
        }
        catch
        {
            Error = "Nie udało się ukończyć kursu.";
        }
        finally
        {
            item.IsCompleting = false;
        }
    }

    private async Task DownloadCertificateAsync(MyCourseItemViewModel item)
    {
        try
        {
            var bytes = await _issuedCertificateService.DownloadForCourseAsync(item.Enrollment.CourseId);
            var path = Path.Combine(FileSystem.CacheDirectory, $"certificate-{item.Enrollment.CourseId}.docx");

            File.WriteAllBytes(path, bytes);

            await Launcher.OpenAsync(new OpenFileRequest
            {
                File = new ReadOnlyFile(path)
            });
        }
        catch
        {
            Error = "Nie udało się pobrać certyfikatu.";
        }
    }

    private void RaiseAll()
    {
        OnPropertyChanged(nameof(ActiveItems));
        OnPropertyChanged(nameof(CompletedItems));
        RaiseUiFlags();
    }

    private void RaiseUiFlags()
    {
        OnPropertyChanged(nameof(ShowEmptyState));
        OnPropertyChanged(nameof(ShowActiveSection));
        OnPropertyChanged(nameof(ShowCompletedSection));
        OnPropertyChanged(nameof(ShowNoActiveText));
        OnPropertyChanged(nameof(ShowNoCompletedText));
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}