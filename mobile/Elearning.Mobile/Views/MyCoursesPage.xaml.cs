using Elearning.Mobile.ViewModels.MyCourses;

namespace Elearning.Mobile.Views;

public partial class MyCoursesPage : ContentPage
{
    private readonly MyCourseViewModel _vm;

    public MyCoursesPage(MyCourseViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _vm.LoadAsync();
    }
}
