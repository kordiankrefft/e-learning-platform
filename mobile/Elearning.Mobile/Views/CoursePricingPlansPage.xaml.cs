using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

[QueryProperty(nameof(CourseId), "courseId")]
public partial class CoursePricingPlansPage : ContentPage
{
    private readonly CoursePricingPlanViewModel _vm;

    public int CourseId { get; set; }

    public CoursePricingPlansPage(CoursePricingPlanViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await _vm.LoadAsync(CourseId);
    }
}
