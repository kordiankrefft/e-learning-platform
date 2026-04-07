using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

[QueryProperty(nameof(CourseId), "courseId")]
public partial class ModulesPage : ContentPage
{
    private readonly ModuleViewModel _vm;

    public int CourseId { get; set; }

    public ModulesPage(ModuleViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (CourseId > 0)
        {
            await _vm.LoadAsync(CourseId);
        }
    }
}
