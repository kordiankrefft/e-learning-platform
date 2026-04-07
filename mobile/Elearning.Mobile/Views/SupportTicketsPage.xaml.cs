using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

public partial class SupportTicketsPage : ContentPage
{
    private readonly SupportTicketViewModel _vm;

    public SupportTicketsPage(SupportTicketViewModel vm)
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
