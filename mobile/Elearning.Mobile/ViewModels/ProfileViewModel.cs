using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Dtos.User;
using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class ProfileViewModel : INotifyPropertyChanged
{
    private readonly UserService _userService;
    private readonly TokenService _tokenService;

    public event PropertyChangedEventHandler? PropertyChanged;

    private bool _isBusy;
    private string? _error;
    private string? _success;

    private bool _isEditMode;
    private int? _userId;

    private string _displayName = "";
    private string _preferredLanguage = "";
    private string _bio = "";

    public bool IsBusy
    {
        get => _isBusy;
        set { if (_isBusy == value) return; _isBusy = value; OnPropertyChanged(); }
    }

    public string? Error
    {
        get => _error;
        set { if (_error == value) return; _error = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasError)); }
    }
    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public string? Success
    {
        get => _success;
        set { if (_success == value) return; _success = value; OnPropertyChanged(); OnPropertyChanged(nameof(HasSuccess)); }
    }
    public bool HasSuccess => !string.IsNullOrWhiteSpace(Success);

    public bool IsEditMode
    {
        get => _isEditMode;
        set
        {
            if (_isEditMode == value) return;
            _isEditMode = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(ProfileTitle));
        }
    }

    public string ProfileTitle => IsEditMode ? "Edytuj profil" : "Utwórz profil";

    public bool IsLoggedIn => !string.IsNullOrWhiteSpace(_token);
    public bool IsLoggedOut => !IsLoggedIn;

    private string? _token;

    public string DisplayName
    {
        get => _displayName;
        set { if (_displayName == value) return; _displayName = value; OnPropertyChanged(); }
    }

    public string PreferredLanguage
    {
        get => _preferredLanguage;
        set { if (_preferredLanguage == value) return; _preferredLanguage = value; OnPropertyChanged(); }
    }

    public string Bio
    {
        get => _bio;
        set { if (_bio == value) return; _bio = value; OnPropertyChanged(); }
    }

    public ICommand LoadCommand { get; }
    public ICommand SaveCommand { get; }
    public ICommand GoToLoginCommand { get; }
    public ICommand GoToRegisterCommand { get; }
    public ICommand LogoutCommand { get; }

    public ProfileViewModel(UserService userService, TokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;

        LoadCommand = new Command(async () => await LoadAsync(), () => !IsBusy);
        SaveCommand = new Command(async () => await SaveAsync(), () => !IsBusy);

        GoToLoginCommand = new Command(async () => await Shell.Current.GoToAsync("login"));
        GoToRegisterCommand = new Command(async () => await Shell.Current.GoToAsync("register"));

        LogoutCommand = new Command(async () => await LogoutAsync());
    }

    public async Task LoadAsync()
    {
        if (IsBusy) return;

        Error = null;
        Success = null;

        try
        {
            IsBusy = true;
            (LoadCommand as Command)?.ChangeCanExecute();
            (SaveCommand as Command)?.ChangeCanExecute();

            _token = await _tokenService.GetAccessTokenAsync();
            OnPropertyChanged(nameof(IsLoggedIn));
            OnPropertyChanged(nameof(IsLoggedOut));

            if (string.IsNullOrWhiteSpace(_token))
            {
                IsEditMode = false;
                _userId = null;
                DisplayName = "";
                PreferredLanguage = "";
                Bio = "";
                return;
            }

            var me = await _userService.GetMeAsync();

            if (me == null)
            {
                _tokenService.Clear();
                _token = null;

                OnPropertyChanged(nameof(IsLoggedIn));
                OnPropertyChanged(nameof(IsLoggedOut));

                IsEditMode = false;
                _userId = null;
                DisplayName = "";
                PreferredLanguage = "";
                Bio = "";

                return;
            }

            IsEditMode = true;
            _userId = me.Id;
            DisplayName = me.DisplayName ?? "";
            PreferredLanguage = me.PreferredLanguage ?? "";
            Bio = me.Bio ?? "";
        }
        catch
        {
            Error = "Nie udało się pobrać profilu. Spróbuj ponownie.";
        }
        finally
        {
            IsBusy = false;
            (LoadCommand as Command)?.ChangeCanExecute();
            (SaveCommand as Command)?.ChangeCanExecute();
        }
    }

    private async Task SaveAsync()
    {
        if (IsBusy) return;

        Error = null;
        Success = null;

        var dn = DisplayName.Trim();
        var pl = PreferredLanguage.Trim();
        var bio = Bio.Trim();

        var isEmpty = string.IsNullOrWhiteSpace(dn) &&
                      string.IsNullOrWhiteSpace(pl) &&
                      string.IsNullOrWhiteSpace(bio);

        if (!IsEditMode && isEmpty)
        {
            Error = "Uzupełnij profil danymi!";
            return;
        }

        try
        {
            IsBusy = true;
            (SaveCommand as Command)?.ChangeCanExecute();

            if (IsEditMode && _userId.HasValue)
            {
                var dto = new UserEditDto
                {
                    Id = _userId.Value,
                    DisplayName = string.IsNullOrWhiteSpace(dn) ? null : dn,
                    PreferredLanguage = string.IsNullOrWhiteSpace(pl) ? null : pl,
                    Bio = string.IsNullOrWhiteSpace(bio) ? null : bio
                };

                await _userService.EditMeAsync(dto);
                Success = "Profil zaktualizowany!";
            }
            else
            {
                var dto = new UserCreateDto
                {
                    DisplayName = string.IsNullOrWhiteSpace(dn) ? null : dn,
                    PreferredLanguage = string.IsNullOrWhiteSpace(pl) ? null : pl,
                    Bio = string.IsNullOrWhiteSpace(bio) ? null : bio
                };

                await _userService.CreateMeAsync(dto);
                Success = "Profil utworzony!";
                IsEditMode = true;

                await LoadAsync();
            }
        }
        catch
        {
            Error = "Nie udało się zapisać profilu. Spróbuj ponownie.";
        }
        finally
        {
            IsBusy = false;
            (SaveCommand as Command)?.ChangeCanExecute();
        }
    }

    private async Task LogoutAsync()
    {
        _tokenService.Clear();

        _token = null;
        OnPropertyChanged(nameof(IsLoggedIn));
        OnPropertyChanged(nameof(IsLoggedOut));

        IsEditMode = false;
        _userId = null;
        DisplayName = "";
        PreferredLanguage = "";
        Bio = "";

        Success = "Wylogowano pomyślnie!";
        Error = null;

        await Shell.Current.GoToAsync("//profile");
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
