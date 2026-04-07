using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.SupportTicket;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class NewSupportTicketViewModel : INotifyPropertyChanged
{
    private readonly SupportTicketService _ticketsService;
    private readonly UserCourseEnrollmentService _enrollmentsService;
    private readonly TokenService _tokenService;
    private readonly CourseService _courseService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;
    private string _title = "";

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            OnPropertyChanged(nameof(CanCreate));
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
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public List<CoursePickItem> Courses { get; private set; } = [];

    private CoursePickItem? _selectedCourse;
    public CoursePickItem? SelectedCourse
    {
        get => _selectedCourse;
        set
        {
            if (_selectedCourse == value) return;
            _selectedCourse = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanCreate));
        }
    }

    public string Title
    {
        get => _title;
        set
        {
            if (_title == value) return;
            _title = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanCreate));
        }
    }

    public bool CanCreate =>
        !IsBusy &&
        SelectedCourse != null &&
        !string.IsNullOrWhiteSpace(Title);

    public ICommand CreateCommand { get; }
    public ICommand CancelCommand { get; }

    public NewSupportTicketViewModel(
        SupportTicketService ticketsService,
        UserCourseEnrollmentService enrollmentsService,
        TokenService tokenService,
        CourseService courseService)
    {
        _ticketsService = ticketsService;
        _enrollmentsService = enrollmentsService;
        _tokenService = tokenService;
        _courseService = courseService;

        CreateCommand = new Command(async () => await CreateAsync());
        CancelCommand = new Command(async () => await Shell.Current.GoToAsync(".."));
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
            return;

        try
        {
            IsBusy = true;
            Error = null;

            var enrollmentsTask = _enrollmentsService.GetMyAsync();
            var coursesTask = _courseService.GetAllAsync();

            await Task.WhenAll(enrollmentsTask, coursesTask);

            var enrollments = enrollmentsTask.Result ?? [];
            var courses = (coursesTask.Result ?? []).Where(c => c.IsActive).ToList();

            var courseTitleById = courses.ToDictionary(c => c.Id, c => c.Title ?? $"Course ID: {c.Id}");

            var map = new Dictionary<int, CoursePickItem>();

            foreach (var e in enrollments)
            {
                if (!e.IsActive) continue;

                var title = courseTitleById.TryGetValue(e.CourseId, out var t)
                    ? t
                    : $"Course ID: {e.CourseId}";

                map[e.CourseId] = new CoursePickItem(e.CourseId, title);
            }

            Courses = map.Values.OrderBy(x => x.Title).ToList();
            OnPropertyChanged(nameof(Courses));

            SelectedCourse = null;
            Title = "";
        }
        catch
        {
            Error = "Nie udało się pobrać listy kursów.";
        }
        finally
        {
            IsBusy = false;
        }
    }


    private async Task CreateAsync()
    {
        if (!CanCreate) return;

        try
        {
            IsBusy = true;
            Error = null;

            await _ticketsService.CreateAsync(new SupportTicketCreateDto
            {
                CourseId = SelectedCourse!.Id,
                Title = Title.Trim(),
                Status = "Open"
            });

            await MainThread.InvokeOnMainThreadAsync(async () =>
            {
                await Shell.Current.GoToAsync("..");
            });
        }
        catch
        {
            Error = "Nie udało się utworzyć zgłoszenia.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public record CoursePickItem(int Id, string Title);
