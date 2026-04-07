using Elearning.Mobile.Models;
using System.ComponentModel;
using System.Windows.Input;

namespace Elearning.Mobile.ViewModels.LessonBlocks;

public class FillBlankBlockViewModel : LessonBlockBaseViewModel
{
    private readonly Action<int> _onCompleted;
    private readonly bool _caseSensitive;

    public string Prompt { get; }
    public List<string> CorrectAnswers { get; }

    public List<FillBlankInputVm> Inputs { get; } = [];

    private bool _isChecked;
    public bool IsChecked
    {
        get => _isChecked;
        set
        {
            if (_isChecked == value) return;
            _isChecked = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(CanCheck));
        }
    }

    private bool? _isCorrect;
    public bool? IsCorrect
    {
        get => _isCorrect;
        set
        {
            if (_isCorrect == value) return;
            _isCorrect = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(ShowResult));
            OnPropertyChanged(nameof(ResultText));
            OnPropertyChanged(nameof(ResultColor));
        }
    }

    public bool ShowResult => IsChecked;
    public string ResultText => IsCorrect == true ? "Poprawnie ✅" : "Źle ❌";
    public Color ResultColor => IsCorrect == true
        ? Color.FromArgb("#34D399")
        : Color.FromArgb("#FCA5A5");

    public bool CanCheck =>
        !IsChecked && Inputs.Any(i => !string.IsNullOrWhiteSpace(i.Answer));

    public ICommand CheckCommand { get; }

    public FillBlankBlockViewModel(
        int id,
        FillBlankContent content,
        Action<int> onCompleted)
        : base(id, "fill_blank")
    {
        _onCompleted = onCompleted;

        Prompt = content.Prompt ?? "";
        CorrectAnswers = [content.Answer ?? ""];
        _caseSensitive = content.CaseSensitive;

        var count = Math.Max(1, CorrectAnswers.Count);
        for (int i = 0; i < count; i++)
        {
            var vm = new FillBlankInputVm();
            vm.AnswerChanged += () => OnPropertyChanged(nameof(CanCheck));
            Inputs.Add(vm);
        }

        CheckCommand = new Command(() =>
        {
            if (!CanCheck) return;

            IsChecked = true;

            bool allCorrect = true;

            for (int i = 0; i < Inputs.Count; i++)
            {
                var user = Normalize(Inputs[i].Answer);
                var corr = i < CorrectAnswers.Count
                    ? Normalize(CorrectAnswers[i])
                    : "";

                if (string.IsNullOrWhiteSpace(corr))
                {
                    allCorrect = false;
                    continue;
                }

                if (user != corr)
                    allCorrect = false;
            }

            IsCorrect = allCorrect;

            if (allCorrect)
                _onCompleted(Id);
        });
    }

    private string Normalize(string? s)
    {
        var t = (s ?? "").Trim();
        return _caseSensitive ? t : t.ToLowerInvariant();
    }
}

public class FillBlankInputVm : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;
    public event Action? AnswerChanged;

    private string _answer = "";
    public string Answer
    {
        get => _answer;
        set
        {
            if (_answer == value) return;
            _answer = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Answer)));
            AnswerChanged?.Invoke();
        }
    }
}
