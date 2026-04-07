using System.Net.Http.Json;
using Elearning.Mobile.Dtos.SupportMessage;

namespace Elearning.Mobile.Services;

public class SupportMessageService
{
    private readonly ApiClient _apiClient;

    public SupportMessageService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<List<SupportMessageDto>> GetForTicketAsync(int ticketId)
    {
        var http = await _apiClient.GetClientAsync();
        var data = await http.GetFromJsonAsync<List<SupportMessageDto>>($"/support-tickets/{ticketId}/messages");
        return data ?? [];
    }

    public async Task CreateAsync(SupportMessageCreateDto dto)
    {
        var http = await _apiClient.GetClientAsync();
        var response = await http.PostAsJsonAsync("/support-messages", dto);
        response.EnsureSuccessStatusCode();
    }
}
