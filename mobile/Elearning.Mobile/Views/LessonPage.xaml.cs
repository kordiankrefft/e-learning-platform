using Elearning.Mobile.ViewModels.LessonDetails;

namespace Elearning.Mobile.Views;

public partial class LessonPage : ContentPage
{
    private readonly LessonDetailViewModel _vm;

    public LessonPage(LessonDetailViewModel vm)
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