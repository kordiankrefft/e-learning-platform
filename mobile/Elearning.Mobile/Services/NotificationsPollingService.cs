namespace Elearning.Mobile.Services;

public class NotificationsPollingService
{
    private readonly UserNotificationService _notifications;
    private CancellationTokenSource? _cts;
    private Task? _loopTask;

    public int UnreadCount { get; private set; }
    public event Action<int>? UnreadCountChanged;

    public NotificationsPollingService(UserNotificationService notifications)
    {
        _notifications = notifications;
    }

    public void Start()
    {
        if (_loopTask != null && !_loopTask.IsCompleted) return;

        _cts = new CancellationTokenSource();
        _loopTask = Task.Run(() => LoopAsync(_cts.Token));
    }

    public async Task ForceRefreshAsync()
        => await RefreshAsync();

    private async Task LoopAsync(CancellationToken ct)
    {
        await Task.Delay(300, ct);

        while (!ct.IsCancellationRequested)
        {
            await RefreshAsync();
            await Task.Delay(2000, ct);
        }
    }

    private async Task RefreshAsync()
    {
        try
        {
            var list = await _notifications.GetMyAsync();
            var unread = list.Count(x => x.IsActive && !x.IsRead);

            if (unread == UnreadCount) return;

            UnreadCount = unread;
            MainThread.BeginInvokeOnMainThread(() =>
                UnreadCountChanged?.Invoke(unread));
        }
        catch
        {
            
        }
    }
}
