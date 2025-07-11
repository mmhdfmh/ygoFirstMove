import math
from itertools import combinations

def calculate_probability(total_cards, cards_to_draw, desired_card_counts):
    """
    N장 중 M장을 뽑을 때, 원하는 T종류의 카드를 각각 1장 이상 뽑을 확률을 계산합니다.

    :param total_cards: N, 전체 카드의 수
    :param cards_to_draw: M, 뽑을 카드의 수
    :param desired_card_counts: [X1, X2, ..., Xt], 원하는 각 카드의 매수 리스트
    :return: 모든 종류의 원하는 카드를 1장 이상 뽑을 확률
    """
    if sum(desired_card_counts) > total_cards:
        raise ValueError("원하는 카드의 총 매수가 전체 카드의 수보다 많을 수 없습니다.")
    if cards_to_draw > total_cards:
        raise ValueError("뽑을 카드의 수가 전체 카드의 수보다 많을 수 없습니다.")
    if cards_to_draw < len(desired_card_counts):
        raise ValueError("뽑을 카드의 수는 적어도 원하는 카드의 종류 수 이상이어야 합니다.")

    # 1. 전체 경우의 수: C(N, M)
    try:
        total_combinations = math.comb(total_cards, cards_to_draw)
    except ValueError:
        return 0.0 # 뽑을 수 없는 경우

    if total_combinations == 0:
        return 0.0

    # 2. 포함-배제 원리를 사용하여 실패하는 경우의 수 계산
    # (적어도 한 종류 이상의 원하는 카드를 뽑지 못하는 경우)
    
    num_desired_types = len(desired_card_counts)
    unfavorable_outcomes = 0
    
    # i는 배제할 카드의 종류 개수
    for i in range(1, num_desired_types + 1):
        # 배제할 카드의 모든 조합 (예: {X1}, {X2}, {X1, X2}, ...)
        for excluded_group in combinations(desired_card_counts, i):
            # 제외된 카드들의 총 매수
            sum_of_excluded_cards = sum(excluded_group)
            
            # 이 카드들을 제외한 나머지 카드들 중에서 M장을 뽑는 경우의 수
            remaining_cards = total_cards - sum_of_excluded_cards
            if remaining_cards >= cards_to_draw:
                term = math.comb(remaining_cards, cards_to_draw)
            else:
                term = 0

            # 포함-배제 원리에 따라 더하거나 뺌
            if i % 2 == 1:
                unfavorable_outcomes += term  # 홀수개 그룹은 더함
            else:
                unfavorable_outcomes -= term  # 짝수개 그룹은 뺌

    # 3. 성공하는 경우의 수 = 전체 경우의 수 - 실패하는 경우의 수
    favorable_outcomes = total_combinations - unfavorable_outcomes

    # 4. 최종 확률 계산
    probability = favorable_outcomes / total_combinations
    
    return probability

# --- 예제 사용법 ---
if __name__ == "__main__":
    N1 = 5  # 전체 카드
    M1 = 5   # 뽑는 카드 수
    X1 = [1, 1, 1, 1, 1] # 스페이드 13장, 다이아 13장
    
    prob1 = calculate_probability(N1, M1, X1)
    print(f"예제 1: N={N1}, M={M1}, 원하는 카드 종류={len(X1)} ({X1}장씩)")
    print(f"확률: {prob1:.4f} ({prob1*100:.2f}%)")
    print("-" * 20)