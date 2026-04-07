using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

public partial class CourseCategoriesPage : ContentPage
{
    private readonly CourseCategoryViewModel _vm;

    public CourseCategoriesPage(CourseCategoryViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (_vm.Categories.Count == 0)
            await _vm.LoadAsync();
    }
}
