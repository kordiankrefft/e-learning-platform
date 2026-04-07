using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class LoginViewModel : INotifyPropertyChanged
{
    private readonly AuthService _authService;
    private readonly TokenService _tokenService;
    private readonly AuthState _authState;

    private string _email = "";
    private string _password = "";
    private bool _isBusy;
    private string? _error;

    public event PropertyChangedEventHandler? PropertyChanged;

    public LoginViewModel(AuthService authService, TokenService tokenService, AuthState authState)
    {
        _authService = authService;
        _tokenService = tokenService;
        _authState = authState;

        LoginCommand = new Command(async () => await LoginAsync(), () => !IsBusy);

        GoToRegisterCommand = new Command(async () =>
        {
            Error = null;
            await Shell.Current.GoToAsync("register");
        });
    }

    public string Email
    {
        get => _email;
        set { _email = value; OnPropertyChanged(); }
    }

    public string Password
    {
        get => _password;
        set { _password = value; OnPropertyChanged(); }
    }

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            _isBusy = value;
            OnPropertyChanged();
            (LoginCommand as Command)?.ChangeCanExecute();
        }
    }

    public string? Error
    {
        get => _error;
        set
        {
            _error = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(HasError));
        }
    }

    public bool HasError => !string.IsNullOrWhiteSpace(Error);

    public ICommand LoginCommand { get; }
    public ICommand GoToRegisterCommand { get; }

    private async Task LoginAsync()
    {
        if (IsBusy) return;

        Error = null;

        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            Error = "Podaj e-mail i hasło.";
            return;
        }

        try
        {
            IsBusy = true;

            var login = await _authService.LoginAsync(Email.Trim(), Password);

            await _tokenService.SetAccessTokenAsync(login.AccessToken);
            _authState.SetToken(login.AccessToken);

            var roles = await _authService.GetMyRolesAsync();
            _authState.SetRoles(roles);

            await Shell.Current.GoToAsync("//profile");
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("401"))
                Error = "Nieprawidłowy e-mail lub hasło.";
            else
                Error = "Wystąpił błąd podczas logowania. Spróbuj ponownie.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
