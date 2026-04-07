using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.SupportTicket;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class SupportTicketViewModel : INotifyPropertyChanged
{
    private readonly SupportTicketService _ticketsService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;
    private string _searchText = "";

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            if (_isBusy == value) return;
            _isBusy = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(IsNotBusy));
            RaiseUiFlags();
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
            RaiseUiFlags();
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public string SearchText
    {
        get => _searchText;
        set
        {
            if (_searchText == value) return;
            _searchText = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(FilteredItems));
            RaiseUiFlags();
        }
    }

    public List<SupportTicketDto> Items { get; private set; } = [];

    public List<SupportTicketDto> FilteredItems
    {
        get
        {
            var q = (SearchText ?? "").Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(q)) return Items;

            return Items.Where(t =>
                (t.Title ?? "").ToLowerInvariant().Contains(q) ||
                (t.Status ?? "").ToLowerInvariant().Contains(q) ||
                (t.CourseTitle ?? "").ToLowerInvariant().Contains(q) ||
                t.Id.ToString().Contains(q)
            ).ToList();
        }
    }

    public bool ShowEmptyState => !IsBusy && !HasError && FilteredItems.Count == 0;
    public bool ShowTable => !IsBusy && !HasError && FilteredItems.Count > 0;

    public int UnreadHelpCount => (Shell.Current as AppShell)?.UnreadHelpCount ?? 0;
    public bool UnreadHelpCountVisible => UnreadHelpCount > 0;
    public string UnreadHelpCountText => UnreadHelpCount.ToString();

    public ICommand RefreshCommand { get; }
    public ICommand OpenTicketCommand { get; }
    public ICommand NewTicketCommand { get; }

    public SupportTicketViewModel(SupportTicketService ticketsService, TokenService tokenService)
    {
        _ticketsService = ticketsService;
        _tokenService = tokenService;

        RefreshCommand = new Command(async () => await LoadAsync());

        OpenTicketCommand = new Command<SupportTicketDto>(async (item) =>
        {
            if (item == null) return;

            await MainThread.InvokeOnMainThreadAsync(async () =>
            {
                await Shell.Current.GoToAsync($"support-ticket-detail?ticketId={item.Id}");
            });
        });

        NewTicketCommand = new Command(async () =>
        {
            await Shell.Current.GoToAsync("new-support-ticket");
        });
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        var token = await _tokenService.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
        {
            Items = [];
            OnPropertyChanged(nameof(Items));
            OnPropertyChanged(nameof(FilteredItems));
            RaiseUiFlags();
            RaiseBadge();
            return;
        }

        try
        {
            IsBusy = true;
            Error = null;

            List<SupportTicketDto> list;

            try
            {
                list = await _ticketsService.GetMyAsync(); // student
            }
            catch
            {
                list = await _ticketsService.GetMyAssignedAsync(); // tutor
            }

            Items = (list ?? [])
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.CreatedAt)
                .ToList();

            OnPropertyChanged(nameof(Items));
            OnPropertyChanged(nameof(FilteredItems));
            RaiseUiFlags();
            RaiseBadge();
        }
        catch
        {
            Error = "Błąd ładowania zgłoszeń pomocy.";
            Items = [];
            OnPropertyChanged(nameof(Items));
            OnPropertyChanged(nameof(FilteredItems));
            RaiseUiFlags();
            RaiseBadge();
        }
        finally
        {
            IsBusy = false;
            RaiseUiFlags();
        }
    }

    private void RaiseUiFlags()
    {
        OnPropertyChanged(nameof(ShowEmptyState));
        OnPropertyChanged(nameof(ShowTable));
    }

    private void RaiseBadge()
    {
        OnPropertyChanged(nameof(UnreadHelpCount));
        OnPropertyChanged(nameof(UnreadHelpCountVisible));
        OnPropertyChanged(nameof(UnreadHelpCountText));
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
