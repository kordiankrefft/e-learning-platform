using Elearning.Mobile.Models;

namespace Elearning.Mobile.Utils;

public static class AnnouncementBodyParser
{
    public static AnnouncementParsedBody Parse(string? body)
    {
        if (string.IsNullOrWhiteSpace(body))
            return AnnouncementParsedBody.FromPlain("");

        var baseObj = JsonHelper.ParseJson<AnnouncementBodyBase>(body);
        if (baseObj is null || string.IsNullOrWhiteSpace(baseObj.Type))
            return AnnouncementParsedBody.FromPlain(body);

        if (baseObj.Type.Equals("pricePromo", StringComparison.OrdinalIgnoreCase))
        {
            var pp = JsonHelper.ParseJson<PricePromoBody>(body);
            return pp is null ? AnnouncementParsedBody.FromPlain(body) : AnnouncementParsedBody.FromPricePromo(pp);
        }

        if (baseObj.Type.Equals("durationPromo", StringComparison.OrdinalIgnoreCase))
        {
            var dp = JsonHelper.ParseJson<DurationPromoBody>(body);
            return dp is null ? AnnouncementParsedBody.FromPlain(body) : AnnouncementParsedBody.FromDurationPromo(dp);
        }

        return AnnouncementParsedBody.FromPlain(body);
    }
}

public class AnnouncementParsedBody
{
    public string Kind { get; private set; } = "plain"; 
    public string PlainText { get; private set; } = "";

    public PricePromoBody? PricePromo { get; private set; }
    public DurationPromoBody? DurationPromo { get; private set; }

    public static AnnouncementParsedBody FromPlain(string text) => new()
    {
        Kind = "plain",
        PlainText = text
    };

    public static AnnouncementParsedBody FromPricePromo(PricePromoBody model) => new()
    {
        Kind = "pricePromo",
        PricePromo = model
    };

    public static AnnouncementParsedBody FromDurationPromo(DurationPromoBody model) => new()
    {
        Kind = "durationPromo",
        DurationPromo = model
    };
}
