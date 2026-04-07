using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

public partial class SupportTicketDetailsPage : ContentPage
{
    private readonly SupportTicketDetailViewModel _vm;

    public SupportTicketDetailsPage(SupportTicketDetailViewModel vm)
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
