using Elearning.Mobile.ViewModels;

namespace Elearning.Mobile.Views;

public partial class HomePage : ContentPage
{
    private readonly HomeViewModel _vm;

    public HomePage(HomeViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = _vm;

        _vm.ScrollToHowItWorksRequested += OnScrollToHowItWorksRequested;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        if (_vm.Blocks.Count == 0 && !_vm.IsBusy)
            await _vm.LoadAsync();
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();

        _vm.ScrollToHowItWorksRequested -= OnScrollToHowItWorksRequested;
    }

    private async void OnScrollToHowItWorksRequested()
    {
        try
        {
            await MainScroll.ScrollToAsync(HowItWorksSection, ScrollToPosition.Start, true);
        }
        catch
        {
        }
    }
}