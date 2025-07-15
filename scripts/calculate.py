import math
from itertools import combinations

def calculate_firstmove_prob(deck: int, draw: int, cards: list[int]) -> float:
    """
    덱 N장에서 M장을 뽑을 때, 손에 각 카드가 한 장 이상 뽑힐 확률을 계산합니다.

    Args:
        deck (int): 전체 덱의 매수 (N)
        draw (int): 뽑을 카드의 수 (M)
        cards (list[int]): 원하는 카드 각각의 매수 ([X1, X2...])

    Returns:
        float: 각 카드를 한 장 이상 뽑을 확률 (0 <= P <= 1)
    """
    # cards가 iterable이 아니라면 변환
    try: iter(cards)
    except: cards = [cards]
    # 덱보다 뽑을 카드가 많거나 원하는 카드의 종류가 뽑을 카드보다 많은 경우 필터링
    if deck < draw or draw < len(cards):
        return 0
    
    # 전체 경우의 수와 뽑히지 않은 경우의 수 초기화
    total_comb_cnt = math.comb(deck, draw)
    fail_comb_cnt = 0
    
    # 각 종류의 카드를 제외하고 뽑는 경우의 수를 뽑히지 않는 경우의 수에 추가
    # 중복되어 계산된 부분은 빼줌
    for i in range(1, len(cards) + 1):
        for exclude_cards in map(sum, combinations(cards, i)):
            remaining_deck = deck - exclude_cards
            term = math.comb(remaining_deck, draw)
            fail_comb_cnt -= (-1) ** i * term
    
    # 전체에서 실패를 빼 성공을 반환
    success_comb_cnt = total_comb_cnt - fail_comb_cnt
    success_comb_prob = success_comb_cnt / total_comb_cnt
    return success_comb_prob

def calculate_total_prob(cases_prob: list[float]) -> float:
    """
    모든 확률 케이스 중 하나 이상이 실현 될 확률을 계산합니다.

    Args:
        cases_prob (list[float]): 각 케이스가 실현 될 확률 [P1, P2...]

    Returns:
        float: 모든 케이스 중 하나 이상이 실현 될 확률 (0 <= P_t <= 1)
    """
    # 실패 확률 초기화
    total_fail_prob = 1
    # 각 케이스가 실패할 확률을 모두 곱함
    for prob in cases_prob:
        total_fail_prob *= 1 - prob
    # 1에서 모두 실패할 확률을 빼 성공 확률을 반환
    total_success_prob = 1 - total_fail_prob
    return total_success_prob