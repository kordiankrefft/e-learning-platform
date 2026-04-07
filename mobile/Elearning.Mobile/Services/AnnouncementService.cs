using Elearning.Mobile.Dtos.Announcement;
using System.Net.Http.Json;

namespace Elearning.Mobile.Services;

public class AnnouncementService
{
    private readonly ApiClient _api;

    public AnnouncementService(ApiClient api) => _api = api;

    public async Task<List<AnnouncementDto>> GetAllAsync()
    {
        var http = await _api.GetClientAsync();
        var res = await http.GetFromJsonAsync<List<AnnouncementDto>>("/announcements");
        return res ?? [];
    }
}
