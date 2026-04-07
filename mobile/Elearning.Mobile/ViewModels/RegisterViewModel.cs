using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Elearning.Mobile.Services.Auth;

namespace Elearning.Mobile.ViewModels;

public class RegisterViewModel : INotifyPropertyChanged
{
    private readonly AuthService _authService;

    private string _email = "";
    private string _password = "";
    private string _confirmPassword = "";
    private bool _isBusy;
    private string? _error;

    public event PropertyChangedEventHandler? PropertyChanged;

    public RegisterViewModel(AuthService authService)
    {
        _authService = authService;

        RegisterCommand = new Command(async () => await RegisterAsync(), () => !IsBusy);
        GoToLoginCommand = new Command(async () =>
        {
            Error = null;
            await Shell.Current.GoToAsync("login");
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

    public string ConfirmPassword
    {
        get => _confirmPassword;
        set { _confirmPassword = value; OnPropertyChanged(); }
    }

    public bool IsBusy
    {
        get => _isBusy;
        set
        {
            _isBusy = value;
            OnPropertyChanged();
            (RegisterCommand as Command)?.ChangeCanExecute();
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

    public ICommand RegisterCommand { get; }
    public ICommand GoToLoginCommand { get; }

    private async Task RegisterAsync()
    {
        if (IsBusy) return;

        Error = null;

        if (string.IsNullOrWhiteSpace(Email) ||
            string.IsNullOrWhiteSpace(Password) ||
            string.IsNullOrWhiteSpace(ConfirmPassword))
        {
            Error = "Uzupełnij wszystkie pola.";
            return;
        }

        if (Password != ConfirmPassword)
        {
            Error = "Hasła nie są takie same.";
            return;
        }

        try
        {
            IsBusy = true;

            await _authService.RegisterAsync(Email.Trim(), Password);
            await Shell.Current.GoToAsync("login");
        }
        catch
        {
            Error = "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
