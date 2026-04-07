using System.Net.Http.Json;
using Elearning.Mobile.Dtos.SupportTicket;

namespace Elearning.Mobile.Services;

public class SupportTicketService
{
    private readonly ApiClient _apiClient;

    public SupportTicketService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<SupportTicketDto>> GetMyAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<SupportTicketDto>>("/my-support-tickets");
        return data ?? [];
    }

    public async Task<List<SupportTicketDto>> GetMyAssignedAsync()
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<SupportTicketDto>>("/my-assigned-tickets");
        return data ?? [];
    }

    public async Task CreateAsync(SupportTicketCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var response = await http.PostAsJsonAsync("/support-tickets", dto);
        response.EnsureSuccessStatusCode();
    }
}
