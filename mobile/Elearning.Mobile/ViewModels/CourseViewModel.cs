using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Models;
using Elearning.Mobile.Services;

namespace Elearning.Mobile.ViewModels;

public class CourseViewModel : INotifyPropertyChanged
{
    private readonly CourseService _coursesService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;

    public int CategoryId { get; private set; }
    public string CategoryName { get; private set; } = "";

    private CourseCardVm? _selectedCourseCard;
    public CourseCardVm? SelectedCourseCard
    {
        get => _selectedCourseCard;
        set
        {
            if (_selectedCourseCard == value) return;
            _selectedCourseCard = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsCourseModalOpen));
        }
    }

    public bool IsCourseModalOpen => SelectedCourseCard != null;

    public ICommand OpenCourseModalCommand { get; }
    public ICommand CloseCourseModalCommand { get; }

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

    public List<CourseCardVm> Courses { get; private set; } = [];

    public ICommand LoadCommand { get; }
    public ICommand OpenPricingCommand { get; }

    public CourseViewModel(CourseService coursesService)
    {
        _coursesService = coursesService;

        LoadCommand = new Command<int>(async (categoryId) =>
        {
            await LoadAsync(categoryId);
        });

        OpenCourseModalCommand = new Command<CourseCardVm>((course) =>
        {
            if (course == null) return;
            SelectedCourseCard = course;
        });

        CloseCourseModalCommand = new Command(() =>
        {
            SelectedCourseCard = null;
        });

        OpenPricingCommand = new Command<CourseCardVm>(async (course) =>
        {
            if (course == null) return;
            await Shell.Current.GoToAsync($"pricing?courseId={course.Id}");
        });
    }

    public async Task LoadAsync(int categoryId)
    {
        if (IsBusy) return;

        try
        {
            IsBusy = true;
            Error = null;
            CategoryId = categoryId;

            var all = await _coursesService.GetAllAsync();

            Courses = all
                .Where(c => c.IsActive && c.CourseCategoryId == categoryId)
                .Select(c =>
                {
                    var path = c.ThumbnailUrl;

                    string? full = null;
                    if (!string.IsNullOrWhiteSpace(path))
                    {
                        if (path.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                            path.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                        {
                            full = path;
                        }
                        else if (path.StartsWith("/"))
                        {
                            full = $"{ApiClient.PublicBaseUrl}{path}";
                        }
                        else
                        {
                            full = $"{ApiClient.PublicBaseUrl}/{path}";
                        }
                    }

                    return new CourseCardVm
                    {
                        Id = c.Id,
                        Title = c.Title,
                        ShortDescription = c.ShortDescription,
                        LongDescription = c.LongDescription,
                        DifficultyLevel = c.DifficultyLevel,
                        Status = c.Status,
                        ThumbnailUrl = path,
                        ImageUrl = full
                    };
                })
                .ToList();

            OnPropertyChanged(nameof(Courses));
        }
        catch
        {
            Error = "Błąd ładowania kursów.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
