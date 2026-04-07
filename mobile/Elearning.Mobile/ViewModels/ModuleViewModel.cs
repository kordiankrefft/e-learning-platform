using Elearning.Mobile.Dtos.Course;
using Elearning.Mobile.Dtos.Lesson;
using Elearning.Mobile.Dtos.Module;
using Elearning.Mobile.Models;
using Elearning.Mobile.Services;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;

namespace Elearning.Mobile.ViewModels;

public class ModuleViewModel : INotifyPropertyChanged
{
    private readonly CourseService _courseService;
    private readonly ModuleService _moduleService;
    private readonly LessonService _lessonService;
    private readonly LessonProgressService _lessonProgressService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;

    public int CourseId { get; private set; }
    public CourseDto? Course { get; private set; }

    public List<ModuleCardModel> Modules { get; private set; } = [];

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            OnPropertyChanged(nameof(HasModules));
            OnPropertyChanged(nameof(ShowEmptyModules));
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
            OnPropertyChanged(nameof(HasModules));
            OnPropertyChanged(nameof(ShowEmptyModules));
        }
    }
    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public bool HasModules => Modules.Count > 0;
    public bool ShowEmptyModules => !IsBusy && !HasError && !HasModules;

    public string HeaderCourseTitle => Course?.Title ?? "Kurs";

    public ICommand LoadCommand { get; }
    public ICommand BackCommand { get; }

    public ModuleViewModel(
        CourseService courseService,
        ModuleService moduleService,
        LessonService lessonService,
        LessonProgressService lessonProgressService)
    {
        _courseService = courseService;
        _moduleService = moduleService;
        _lessonService = lessonService;
        _lessonProgressService = lessonProgressService;

        LoadCommand = new Command<int>(async (courseId) => await LoadAsync(courseId));
        BackCommand = new Command(async () => await Shell.Current.GoToAsync("//mycourses"));
    }

    public async Task LoadAsync(int courseId)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Error = null;

            CourseId = courseId;

            Course = await _courseService.GetAsync(courseId);

            var allModules = await _moduleService.GetCourseModulesAsync(courseId);
            var activeModules = (allModules ?? [])
                .Where(m => m.IsActive)
                .OrderBy(m => m.OrderIndex)
                .ToList();

            var allProgress = await _lessonProgressService.GetAllAsync();
            var progressByLessonId = (allProgress ?? [])
                .Where(p => p.IsActive)
                .ToDictionary(p => p.LessonId, p => (int)p.ProgressPercent);

            var lessonsResults = await Task.WhenAll(activeModules.Select(async m =>
            {
                var lessons = await _lessonService.GetModuleLessonsAsync(m.Id);
                var activeLessons = (lessons ?? []).Where(l => l.IsActive).ToList();
                return (moduleId: m.Id, lessons: activeLessons);
            }));

            var lessonsMap = lessonsResults.ToDictionary(x => x.moduleId, x => x.lessons);

            var cards = new List<ModuleCardModel>();

            foreach (ModuleDto m in activeModules)
            {
                var lessons = lessonsMap.TryGetValue(m.Id, out var list) ? list : new List<LessonDto>();
                int total = lessons.Count;

                int completed = lessons.Count(lesson =>
                {
                    int percent = progressByLessonId.TryGetValue(lesson.Id, out var p) ? p : 0;
                    return percent >= 100;
                });

                bool unlocked = total > 0 && completed == total;

                cards.Add(new ModuleCardModel
                {
                    ModuleId = m.Id,
                    OrderIndex = m.OrderIndex,
                    Title = m.Title ?? "",
                    Description = m.Description,

                    TotalLessons = total,
                    CompletedLessons = completed,
                    IsUnlocked = unlocked,

                    OpenLessonsCommand = new Command(async () =>
                        await Shell.Current.GoToAsync($"modulelessons?moduleId={m.Id}")),

                    OpenQuizCommand = new Command(async () =>
                        await Shell.Current.GoToAsync($"quiz?moduleId={m.Id}"))
                });
            }

            Modules = cards;

            OnPropertyChanged(nameof(Course));
            OnPropertyChanged(nameof(HeaderCourseTitle));
            OnPropertyChanged(nameof(Modules));
            OnPropertyChanged(nameof(HasModules));
            OnPropertyChanged(nameof(ShowEmptyModules));
        }
        catch
        {
            Error = "Błąd ładowania modułów.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
