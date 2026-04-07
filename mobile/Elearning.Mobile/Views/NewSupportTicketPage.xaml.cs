using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

public partial class NewSupportTicketPage : ContentPage
{
    private readonly NewSupportTicketViewModel _vm;

    public NewSupportTicketPage(NewSupportTicketViewModel vm)
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
