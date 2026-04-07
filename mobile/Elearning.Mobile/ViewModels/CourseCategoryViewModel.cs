using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.CourseCategory;
using Elearning.Mobile.Services;

namespace Elearning.Mobile.ViewModels;

public class CourseCategoryViewModel : INotifyPropertyChanged
{
    private readonly CourseCategoryService _categoriesService;

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

    public List<CourseCategoryDto> Categories { get; private set; } = [];

    public ICommand RefreshCommand { get; }
    public ICommand OpenCoursesCommand { get; }

    public CourseCategoryViewModel(CourseCategoryService categoriesService)
    {
        _categoriesService = categoriesService;

        RefreshCommand = new Command(async () => await LoadAsync(), () => !IsBusy);

        OpenCoursesCommand = new Command<CourseCategoryDto>(async (cat) =>
        {
            if (cat == null) return;

            var name = Uri.EscapeDataString(cat.Name ?? "");
            await Shell.Current.GoToAsync($"courses?categoryId={cat.Id}&categoryName={name}");
        });
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        Error = null;

        try
        {
            IsBusy = true;
            (RefreshCommand as Command)?.ChangeCanExecute();

            var all = await _categoriesService.GetAllAsync();

            Categories = all
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToList();

            OnPropertyChanged(nameof(Categories));
        }
        catch
        {
            Error = "Błąd ładowania kategorii.";
        }
        finally
        {
            IsBusy = false;
            (RefreshCommand as Command)?.ChangeCanExecute();
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
