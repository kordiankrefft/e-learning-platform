using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

[QueryProperty(nameof(ModuleId), "moduleId")]
public partial class LessonsPage : ContentPage
{
    private readonly LessonViewModel _vm;

    public int ModuleId { get; set; }

    public LessonsPage(LessonViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (ModuleId > 0)
        {
            await _vm.LoadAsync(ModuleId);
        }
    }
}
