using System.ComponentModel;
using System.Windows.Input;
using Elearning.Mobile.Dtos.QuizTake;

namespace Elearning.Mobile.ViewModels.Quizzes;

public class QuizQuestionViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    private readonly Action _onAnswerChanged;

    public int Id { get; }
    public int OrderIndex { get; }
    public string QuestionText { get; }
    public decimal Points { get; }

    public string HeaderText => $"{OrderIndex}. {QuestionText}";
    public string PointsText => $"{Points} pkt";

    public List<QuizOptionViewModel> Options { get; }

    public int? SelectedOptionId { get; private set; }

    public ICommand SelectOptionCommand { get; }

    public QuizQuestionViewModel(QuizTakeQuestionDto dto, Action onAnswerChanged)
    {
        _onAnswerChanged = onAnswerChanged;

        Id = dto.Id;
        OrderIndex = dto.OrderIndex;
        QuestionText = dto.QuestionText ?? "";
        Points = dto.Points;

        Options = (dto.Options ?? [])
            .OrderBy(o => o.OrderIndex)
            .Select(o => new QuizOptionViewModel(o.Id, o.AnswerText))
            .ToList();

        SelectOptionCommand = new Command<QuizOptionViewModel>(SelectOption);
    }

    private void SelectOption(QuizOptionViewModel? opt)
    {
        if (opt == null) return;

        foreach (var o in Options)
            o.IsSelected = false;

        opt.IsSelected = true;
        SelectedOptionId = opt.Id;

        foreach (var o in Options)
            o.RaiseVisuals();

        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(SelectedOptionId)));
        _onAnswerChanged?.Invoke();
    }
}