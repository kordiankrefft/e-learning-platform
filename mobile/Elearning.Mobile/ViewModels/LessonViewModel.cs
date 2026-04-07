using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.Lesson;
using Elearning.Mobile.Services;

namespace Elearning.Mobile.ViewModels;

public class LessonViewModel : INotifyPropertyChanged
{
    private readonly LessonService _lessonService;

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

    public int ModuleId { get; private set; }

    public List<LessonDto> Lessons { get; private set; } = [];

    public bool HasLessons => Lessons.Count > 0;
    public bool ShowEmptyLessons => !IsBusy && !HasError && Lessons.Count == 0;

    public ICommand LoadCommand { get; }
    public ICommand BackCommand { get; }
    public ICommand OpenLessonCommand { get; }

    public LessonViewModel(LessonService lessonService)
    {
        _lessonService = lessonService;

        LoadCommand = new Command<int>(async (moduleId) => await LoadAsync(moduleId));
        BackCommand = new Command(async () => await Shell.Current.GoToAsync(".."));

        OpenLessonCommand = new Command<LessonDto>(async (lesson) =>
        {
            if (lesson == null) return;
            await Shell.Current.GoToAsync($"lesson?lessonId={lesson.Id}");
        });
    }

    public async Task LoadAsync(int moduleId)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Error = null;

            ModuleId = moduleId;

            var allLessons = await _lessonService.GetModuleLessonsAsync(moduleId);

            Lessons = (allLessons ?? [])
                .Where(l => l.IsActive)
                .OrderBy(l => l.OrderIndex)
                .ToList();

            OnPropertyChanged(nameof(Lessons));
            OnPropertyChanged(nameof(HasLessons));
            RaiseUiFlags();
        }
        catch
        {
            Error = "Błąd ładowania lekcji.";
        }
        finally
        {
            IsBusy = false;
            RaiseUiFlags();
        }
    }

    public string HeaderModuleText => ModuleId > 0 ? $"Moduł #{ModuleId}" : "Moduł —";

    private void RaiseUiFlags()
    {
        OnPropertyChanged(nameof(ShowEmptyLessons));
        OnPropertyChanged(nameof(HasLessons));
        OnPropertyChanged(nameof(HeaderModuleText));
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
