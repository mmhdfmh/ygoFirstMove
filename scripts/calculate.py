import math
from itertools import combinations
from functools import reduce, lru_cache

def _reduce_rule_max_value(dict1: dict, dict2: dict) -> dict:
    if dict1 == None:
        return None
    ret = dict1.copy()
    for key, value in dict2.items():
        ret_value = ret.get(key)
        if ret_value != None:
            if ret_value > 0 and value <= 0 or ret_value <= 0 and value > 0:
                return None
            ret[key] = max(ret_value, value)
        else:
            ret[key] = value
    return ret

@lru_cache
def _hand_combination(deck: int, draw: int, cards_tuple: tuple[tuple[str, int]], case_tuple: tuple[tuple[str, int]]) -> int:
    cards = dict(cards_tuple)
    
    include_case = tuple((k, v) for k, v in case_tuple if v > 0)
    exclude_case = tuple((k, v) for k, v in case_tuple if v <= 0)
    
    if exclude_case:
        for card, req in exclude_case:
            deck -= cards.pop(card, 0)
        
        if draw > deck:
            return 0
        
        cards_tuple = tuple(sorted(cards.items()))
        return _hand_combination(deck, draw, cards_tuple, include_case)

    if not case_tuple:
        return math.comb(deck, draw)
    
    card, req = case_tuple[0]
    remain_case = case_tuple[1:]
    card_cnt = cards.get(card, 0)
    deck -= card_cnt
    
    return sum(
        math.comb(card_cnt, i) * _hand_combination(deck, draw - i, cards_tuple, remain_case)
        for i in range(req, min(card_cnt, draw) + 1)
    )

def total_prob(deck: int, draw: int, cards: dict[str, int], cases: list[dict[str, int]]) -> float:
    total_combination = math.comb(deck, draw)
    if total_combination == 0:
        return 0.
    success_combination = 0
    
    cards_tuple = tuple(sorted(cards.items()))
    for i in range(1, len(cases) + 1):
        for case_combination in combinations(cases, i):
            merge_case = reduce(_reduce_rule_max_value, case_combination)
            
            if merge_case != None:
                merge_case_tuple = tuple(sorted(merge_case.items()))
                success_combination -= (-1)**i * _hand_combination(deck, draw, cards_tuple, merge_case_tuple)
            
    success_prob = success_combination / total_combination
    return success_prob