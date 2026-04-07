using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

[QueryProperty(nameof(CategoryId), "categoryId")]
public partial class CoursesPage : ContentPage
{
    private readonly CourseViewModel _vm;

    public int CategoryId { get; set; }

    public CoursesPage(CourseViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _vm.LoadAsync(CategoryId);
    }
}
