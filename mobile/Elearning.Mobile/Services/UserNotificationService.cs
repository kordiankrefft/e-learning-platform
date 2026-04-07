using System.Net.Http.Json;
using Elearning.Mobile.Dtos.UserNotification;

namespace Elearning.Mobile.Services;

public class UserNotificationService
{
    private readonly ApiClient _apiClient;

    public UserNotificationService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<UserNotificationDto>> GetMyAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<UserNotificationDto>>("/user-notifications/my");
        return data ?? [];
    }

    public async Task MarkAsReadAsync(int id)
    {
        var http = await _apiClient.GetClientAsync();
        var dto = new UserNotificationEditDto
        {
            Id = id,
            IsRead = true
        };
        var response = await http.PutAsJsonAsync($"/user-notifications/{id}",dto);
        response.EnsureSuccessStatusCode();
    }
}
