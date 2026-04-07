using System.Net.Http.Json;
using Elearning.Mobile.Dtos.Module;

namespace Elearning.Mobile.Services;

public class ModuleService
{
    private readonly ApiClient _api;

    public ModuleService(ApiClient api) => _api = api;

    public async Task<List<ModuleDto>> GetCourseModulesAsync(int courseId)
    {
        var http = await _api.GetClientAsync();
        var res = await http.GetFromJsonAsync<List<ModuleDto>>($"/courses/{courseId}/modules");
        return res ?? [];
    }

    public async Task<ModuleDto?> GetAsync(int id)
    {
        var http = await _api.GetClientAsync();
        return await http.GetFromJsonAsync<ModuleDto>($"/modules/{id}");
    }
}
