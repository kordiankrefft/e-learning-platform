using Elearning.Mobile.Services;
using Elearning.Mobile.Views;

namespace Elearning.Mobile;

public partial class AppShell : Shell
{
    private readonly NotificationsPollingService polling;

    private bool _isBackVisible;
    public bool IsBackVisible
    {
        get => _isBackVisible;
        set
        {
            if (_isBackVisible == value) return;
            _isBackVisible = value;
            OnPropertyChanged();
        }
    }

    private int _unreadHelpCount;
    public int UnreadHelpCount
    {
        get => _unreadHelpCount;
        set
        {
            if (_unreadHelpCount == value) return;
            _unreadHelpCount = value;
            OnPropertyChanged();
        }
    }

    public AppShell(NotificationsPollingService polling)
    {
        InitializeComponent();
        BindingContext = this;

        this.polling = polling;

        Routing.RegisterRoute("login", typeof(LoginPage));
        Routing.RegisterRoute("register", typeof(RegisterPage));
        Routing.RegisterRoute("courses", typeof(CoursesPage));
        Routing.RegisterRoute("pricing", typeof(CoursePricingPlansPage));
        Routing.RegisterRoute("modules", typeof(ModulesPage));
        Routing.RegisterRoute("modulelessons", typeof(LessonsPage));
        Routing.RegisterRoute("support-ticket-detail", typeof(SupportTicketDetailsPage));
        Routing.RegisterRoute("new-support-ticket", typeof(NewSupportTicketPage));
        Routing.RegisterRoute("lesson", typeof(LessonPage));
        Routing.RegisterRoute("quiz", typeof(QuizPage));



        Navigated += (_, __) => UpdateBackVisibility();

        polling.UnreadCountChanged += unread =>
        {
            MainThread.BeginInvokeOnMainThread(() =>
            {
                UnreadHelpCount = unread;
            });
        };

        polling.Start();
        _ = polling.ForceRefreshAsync();
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        UpdateBackVisibility();
    }

    private async void OnLogoTapped(object sender, TappedEventArgs e)
        => await GoToAsync("//home");

    private async void OnBackClicked(object sender, EventArgs e)
    {
        if (Navigation?.NavigationStack?.Count > 1)
        {
            await GoToAsync("..");
            return;
        }

        await GoToAsync("//home");
    }

    private void UpdateBackVisibility()
        => IsBackVisible = (Navigation?.NavigationStack?.Count ?? 0) > 1;
}
