namespace Elearning.Mobile.Services.Auth;

public class TokenService
{
    private const string AccessTokenKey = "authToken";

    public async Task<string?> GetAccessTokenAsync()
        => await SecureStorage.GetAsync(AccessTokenKey);

    public async Task SetAccessTokenAsync(string token)
        => await SecureStorage.SetAsync(AccessTokenKey, token);

    public void Clear()
        => SecureStorage.Remove(AccessTokenKey);
}
