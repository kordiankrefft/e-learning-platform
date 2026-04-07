using System;
using System.Text.Json;

namespace Elearning.Mobile.Models;

public static class BlockContentParser
{

    public static TextContent ParseText(string? json)
    {
        var res = new TextContent();

        if (string.IsNullOrWhiteSpace(json))
            return res;

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (TryGetString(root, out var title, "title"))
                res.Title = title;

            if (TryGetString(root, out var text, "text", "content", "body", "value"))
                res.Text = text;

            if (string.IsNullOrWhiteSpace(res.Text))
                res.Text = json;

            return res;
        }
        catch
        {
            res.Text = json ?? "";
            return res;
        }
    }

    public static string GetText(string? json)
    => ParseText(json).Text;

    public static SingleChoiceContent ParseSingleChoice(string? json)
    {
        var result = new SingleChoiceContent();

        if (string.IsNullOrWhiteSpace(json))
            return result;

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (TryGetString(root, out var q, "question", "prompt", "title", "text"))
                result.Question = q;

            if (TryGetString(root, out var exp, "explanation"))
                result.Explanation = exp;

            int correctIndex = -1;
            if (root.TryGetProperty("correctIndex", out var ci) && ci.ValueKind == JsonValueKind.Number)
                correctIndex = ci.GetInt32();

            if (root.TryGetProperty("options", out var optionsEl) && optionsEl.ValueKind == JsonValueKind.Array)
            {
                var idx = 0;
                foreach (var opt in optionsEl.EnumerateArray())
                {
                    var text = opt.ValueKind == JsonValueKind.String ? (opt.GetString() ?? "") : opt.ToString();

                    result.Options.Add(new SingleChoiceOption
                    {
                        Text = text,
                        IsCorrect = (idx == correctIndex)
                    });

                    idx++;
                }
            }

            if (string.IsNullOrWhiteSpace(result.Question))
                result.Question = result.Options.Count > 0 ? "Wybierz odpowiedź:" : (json ?? "");

            return result;
        }
        catch
        {
            result.Question = json ?? "";
            return result;
        }
    }

    public static FillBlankContent ParseFillBlank(string? json)
    {
        var result = new FillBlankContent();

        if (string.IsNullOrWhiteSpace(json))
            return result;

        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            if (TryGetString(root, out var prompt, "prompt", "question", "text", "sentence", "title"))
                result.Prompt = prompt;

            if (TryGetString(root, out var answer, "answer", "correct", "value"))
                result.Answer = answer;

            if (TryGetString(root, out var exp, "explanation"))
                result.Explanation = exp;

            if (root.TryGetProperty("caseSensitive", out var cs) &&
                (cs.ValueKind == JsonValueKind.True || cs.ValueKind == JsonValueKind.False))
            {
                result.CaseSensitive = cs.GetBoolean();
            }

            return result;
        }
        catch
        {
            result.Prompt = json ?? "";
            return result;
        }
    }

    //próbuje znaleźć pierwszy pasujący klucz
    private static bool TryGetString(JsonElement el, out string value, params string[] names)
    {
        foreach (var n in names)
        {
            if (el.TryGetProperty(n, out var p) && p.ValueKind == JsonValueKind.String)
            {
                value = p.GetString() ?? "";
                return true;
            }
        }

        value = "";
        return false;
    }
}

public class TextContent
{
    public string Title { get; set; } = "";
    public string Text { get; set; } = "";
}

public class SingleChoiceContent
{
    public string Question { get; set; } = "";
    public string? Explanation { get; set; }
    public List<SingleChoiceOption> Options { get; set; } = [];
}

public class SingleChoiceOption
{
    public string Text { get; set; } = "";
    public bool IsCorrect { get; set; }
}

public class FillBlankContent
{
    public string Prompt { get; set; } = "";
    public string Answer { get; set; } = "";
    public bool CaseSensitive { get; set; }
    public string? Explanation { get; set; }
}
