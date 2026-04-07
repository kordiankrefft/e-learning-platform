using Elearning.Mobile.Dtos.PageContentBlock;
using System.Net.Http.Json;

namespace Elearning.Mobile.Services;

public class PageContentBlockService
{
    private readonly ApiClient _api;

    public PageContentBlockService(ApiClient api) => _api = api;

    public async Task<List<PageContentBlockDto>> GetByPageKeyAsync(string pageKey)
    {
        var http = await _api.GetClientAsync();
        var res = await http.GetFromJsonAsync<List<PageContentBlockDto>>($"/page-content-blocks/page/{pageKey}");
        return res ?? [];
    }
}
