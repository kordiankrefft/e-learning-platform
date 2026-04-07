namespace Elearning.Mobile.Services.Auth;

public class AuthState
{
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(AccessToken);
    public string? AccessToken { get; private set; }
    public List<string> Roles { get; private set; } = [];

    public void SetToken(string token) => AccessToken = token;
    public void SetRoles(List<string> roles) => Roles = roles;

    public void Clear()
    {
        AccessToken = null;
        Roles = [];
    }

    public bool HasRole(string role) => Roles.Contains(role);
}
