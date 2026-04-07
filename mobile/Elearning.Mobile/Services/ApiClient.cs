using Elearning.Mobile.Services.Auth;
using System.Net.Http.Headers;

namespace Elearning.Mobile.Services;

public class ApiClient
{
    private readonly HttpClient _http;
    private readonly TokenService _tokenService;

    public static string BaseUrl =>
        DeviceInfo.Platform == DevicePlatform.Android
            ? "https://10.0.2.2:7164"
            : "https://localhost:7164";
    public static string PublicBaseUrl =>
        DeviceInfo.Platform == DevicePlatform.Android 
            ? "http://10.0.2.2:5180"
            : "http://localhost:5180";
    public ApiClient(TokenService tokenService)
    {
        _tokenService = tokenService;

        var handler = new HttpClientHandler();

#if DEBUG
        if (DeviceInfo.Platform == DevicePlatform.Android)
        {
            handler.ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        }
#endif

        _http = new HttpClient(handler)
        {
            BaseAddress = new Uri(BaseUrl)
        };
    }

    public async Task<HttpClient> GetClientAsync()
    {
        string? token = await _tokenService.GetAccessTokenAsync();

        _http.DefaultRequestHeaders.Authorization = null;
        if (!string.IsNullOrWhiteSpace(token))
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", token);
        }

        return _http;
    }
}
