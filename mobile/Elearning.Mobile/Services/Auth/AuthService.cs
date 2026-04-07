using System.Net.Http.Json;
using Elearning.Mobile.Dtos.Auth;

namespace Elearning.Mobile.Services.Auth;

public class AuthService
{
    private readonly ApiClient _apiClient;

    public AuthService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<LoginResponse> LoginAsync(string email, string password)
    {
        HttpClient http = await _apiClient.GetClientAsync();

        var req = new LoginRequest { Email = email, Password = password };
        HttpResponseMessage res = await http.PostAsJsonAsync("/login", req);

        if (!res.IsSuccessStatusCode)
        {
            string body = await res.Content.ReadAsStringAsync();
            throw new Exception($"Login failed ({(int)res.StatusCode}). {body}");
        }

        LoginResponse? dto = await res.Content.ReadFromJsonAsync<LoginResponse>();
        if (dto is null || string.IsNullOrWhiteSpace(dto.AccessToken))
            throw new Exception("Login failed: empty accessToken.");

        return dto;
    }

    public async Task RegisterAsync(string email, string password)
    {
        HttpClient http = await _apiClient.GetClientAsync();

        var req = new RegisterRequest { Email = email, Password = password };
        HttpResponseMessage res = await http.PostAsJsonAsync("/register", req);

        if (!res.IsSuccessStatusCode)
        {
            string body = await res.Content.ReadAsStringAsync();
            throw new Exception($"Register failed ({(int)res.StatusCode}). {body}");
        }
    }

    public async Task<List<string>> GetMyRolesAsync()
    {
        HttpClient http = await _apiClient.GetClientAsync();

        HttpResponseMessage res = await http.GetAsync("/my-roles");
        if (!res.IsSuccessStatusCode) return [];

        var roles = await res.Content.ReadFromJsonAsync<List<string>>();
        return roles ?? [];
    }
}
