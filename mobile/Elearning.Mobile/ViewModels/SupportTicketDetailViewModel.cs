using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.SupportMessage;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class SupportTicketDetailViewModel : INotifyPropertyChanged, IQueryAttributable
{
    private readonly SupportMessageService _messagesService;
    private readonly UserNotificationService _notificationsService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    public int TicketId { get; private set; }

    private bool _isBusy;
    private string? _error;
    private string _messageBody = "";
    private bool _isSending;

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
        }
    }

    public bool IsNotBusy => !IsBusy;

    public string? Error
    {
        get => _error;
        set
        {
            if (_error == value) return;
            _error = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public List<SupportMessageDto> Items { get; private set; } = [];

    public string MessageBody
    {
        get => _messageBody;
        set
        {
            if (_messageBody == value) return;
            _messageBody = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanSend)); 
        }
    }

    public bool IsSending
    {
        get => _isSending;
        set
        {
            if (_isSending == value) return;
            _isSending = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanSend)); 
        }
    }

    public bool CanSend => !IsSending && !string.IsNullOrWhiteSpace(MessageBody);

    public ICommand RefreshCommand { get; }
    public ICommand SendCommand { get; }

    public SupportTicketDetailViewModel(
        SupportMessageService messagesService,
        UserNotificationService notificationsService,
        TokenService tokenService)
    {
        _messagesService = messagesService;
        _notificationsService = notificationsService;
        _tokenService = tokenService;

        RefreshCommand = new Command(async () => await LoadAsync());
        SendCommand = new Command(async () => await SendAsync());
    }

    public void ApplyQueryAttributes(IDictionary<string, object> query)
    {
        if (query.TryGetValue("ticketId", out var raw) &&
            int.TryParse(raw?.ToString(), out var id))
        {
            TicketId = id;
            OnPropertyChanged(nameof(TicketId));
        }
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
        {
            Items = [];
            OnPropertyChanged(nameof(Items));
            return;
        }

        if (TicketId <= 0)
        {
            Error = "Nieprawidłowe ID zgłoszenia.";
            Items = [];
            OnPropertyChanged(nameof(Items));
            return;
        }

        try
        {
            IsBusy = true;
            Error = null;

            var list = await _messagesService.GetForTicketAsync(TicketId);

            Items = (list ?? [])
                .Where(x => x.IsActive)
                .OrderBy(x => x.SentAt)
                .ToList();

            OnPropertyChanged(nameof(Items));

            await MarkNotificationsReadForThisTicketAsync();
        }
        catch
        {
            Error = "Nie udało się pobrać rozmowy.";
            Items = [];
            OnPropertyChanged(nameof(Items));
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task MarkNotificationsReadForThisTicketAsync()
    {
        try
        {
            var list = await _notificationsService.GetMyAsync();

            var unreadForThisTicket = (list ?? [])
                .Where(n => n.IsActive && !n.IsRead && n.SupportTicketId == TicketId)
                .ToList();

            foreach (var n in unreadForThisTicket)
                await _notificationsService.MarkAsReadAsync(n.Id);
        }
        catch
        {
            
        }
    }

    private async Task SendAsync()
    {
        if (!CanSend) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token)) return;

        var text = (MessageBody ?? "").Trim();
        if (string.IsNullOrWhiteSpace(text)) return;
        if (TicketId <= 0) return;

        try
        {
            IsSending = true;
            Error = null;

            await _messagesService.CreateAsync(new SupportMessageCreateDto
            {
                SupportTicketId = TicketId,
                MessageBody = text
            });

            MessageBody = "";

            await LoadAsync();
        }
        catch
        {
            Error = "Nie udało się wysłać wiadomości.";
        }
        finally
        {
            IsSending = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
