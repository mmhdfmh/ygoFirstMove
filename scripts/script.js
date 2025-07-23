let cards = {};
let share_data = [40, 5, {}, [{}]];

// cards와 select의 카드 이름 동기화
function sync_cardname() {
    cards = {};
    $('div.card').each(function() {
        let key = $(this).find('input.card_name').val();
        let value = parseInt($(this).find('input.card_cnt').val());
        if(key) {
            cards[key] = value;
            $('select.card_name').append(`
                <option value="${key}">${key}</option>
            `);
        }
    });

    let $deck = $('input#deck'),
        $draw = $('input#draw'),
        cards_cnt = Object.values(cards).reduce(function (a, b) {
            return a + b
        }, 0);
    if(parseInt($deck.val()) < cards_cnt)
        $deck.val(cards_cnt);
    if(parseInt($deck.val()) < parseInt($draw.val()))
        $draw.val($deck.val());
    
    $('select.card_name').each(function() {
        let selected = $(this).val();
        $(this).empty().append(`
            <option disabled selected value="">카드 선택</option>
        `);
        for(let key in cards)
            $(this).append(`
                <option value="${key}">${key}</option>
            `);
        if($(this).find(`option[value="${selected}"]`).length > 0)
            $(this).val(selected);
        else
            $(this).val('');
    });
}

function clear_data() {
    cards = {};
    share_data = [40, 5, {}, [{}]];

    $('input#deck').val(40);
    $('input#draw').val(5);

    $('div#card_list div.card').remove();
    $('button#add_card_list').click();

    $('div#combo_list div.combo').remove();
    $('button#add_combo_list').click();

    $('table#result').empty();
    $('button#share').hide();

    $('div#card_list div.card input.card_name').first().focus()
}

$('h2#reset').on('click', clear_data);

// 정보 입력시 동기화
$('input#deck').on('change', sync_cardname);
$('input#draw').on('change', sync_cardname);
$('div#card_list').on('change', 'input.card_name', sync_cardname);
$('div#card_list').on('change', 'input.card_cnt', sync_cardname);

// 초동 카드 추가
$('button#add_card_list').on('click', function() {
    $(this).parent().before(`
        <div class="card">
            <input class="card_name" type="text" placeholder="초동 이름">
            <input class="card_cnt" type="number" value="3" min="1" max="60">
        </div>
    `);
    $('div#card_list div.card input.card_name').last().focus();

    if($('div.card').length > 1)
        $('button#sub_card_list').show();
});

// 초동 카드 제거
$('button#sub_card_list').on('click', function() {
    let $card_list = $('div#card_list div.card');
    if($card_list.length > 1) {
        $card_list.last().remove();
        sync_cardname();
        $('div#card_list div.card input.card_name').last().focus();
    }

    if($card_list.length <= 2)
        $(this).hide();
});

// 초동 조합식 확장
$('div#combo_list').on('click', 'button#add_combo', function() {
    let $combo = $(this).closest('div.combo')
    $(this).before(`
        <span>&nbsp;+&nbsp;</span>
        <div class="card">
            <select class="card_name">
                <option disabled selected value="">카드 선택</option>
            </select>
            <input class="card_cnt" type="number" value="1" min="0" max="60">
        </div>
    `);
    sync_cardname();
    $combo.find('div.card select.card_name').last().focus();

    if($combo.find('div.card').length > 1)
        $combo.find('button#sub_combo').show();
});

// 초동 조합식 축소
$('div#combo_list').on('click', 'button#sub_combo', function() {
    let $combo = $(this).closest('div.combo')
    if($combo.find('div.card').length > 1) {
        $combo.find('div.card').last().remove();
        $combo.find('span').last().remove();
        $combo.find('div.card select.card_name').last().focus();
    }

    if($combo.find('div.card').length <= 1)
        $(this).hide();
});

// 초동 조합 추가
$('button#add_combo_list').on('click', function() {
    $(this).parent().before(`
        <div class="combo">
            <div class="card">
                <select class="card_name">
                    <option disabled selected value="">카드 선택</option>
                </select>
                <input class="card_cnt" type="number" value="1" min="0" max="60">
            </div>
            <button id="add_combo">+</button>
            <button hidden id="sub_combo">-</button>
        </div>
    `);
    sync_cardname();
    $('div.combo div.card select.card_name').last().focus();

    if($('div.combo').length > 1)
        $('button#sub_combo_list').show();
});

// 초동 조합 제거
$('button#sub_combo_list').on('click', function() {
    let $combo_list = $('div.combo');
    if($combo_list.length > 1) {
        $combo_list.last().remove();
        $('div.combo div.card select.card_name').last().focus();
    }

    if($combo_list.length <= 2)
        $(this).hide();
});

// div#combo_list를 Array[Object] 형태로 반환
function get_cases() {
    let cases = [];
    $('div#combo_list div.combo').each(function() {
        let combo = {};
        $(this).find('div.card').each(function() {
            let key = $(this).find('select.card_name').val();
            let value = parseInt($(this).find('input.card_cnt').val());

            if(key && key != '')
                combo[key] = value;
        });
        if(Object.keys(combo).length != 0)
            cases.push(combo);
    });
    
    return cases;
}

// 계산 (pyodide 사용)
$('button#calculate').on('click', function() {
    let deck = parseInt($('input#deck').val()),
        draw = parseInt($('input#draw').val()),
        cards_py = pyodide.toPy(cards),
        cases = get_cases();

    if(cases.length == 0)
        alert('초동 조합을 입력해야합니다.');
    else if(total_prob == null) {
        $(this).html('계산중...');
        setTimeout(function() {$('button#calculate').click()}, 500);
    } else {
        $(this).html('계산중...');
        $('button#share').hide();
        let $table = $('table#result');
        $table.empty();
        $table.append(`
            <tr>
                <td>덱</td>
                <td>${deck}장</td>
                <td>드로우</td>
                <td>${draw}장</td>
            </tr>
        `);
        cases.forEach(function(item) {
            let title = Object.entries(item).map(([key, value]) => `${key} * ${value}`).join(' + '),
                result = total_prob(deck, draw, cards_py, pyodide.toPy([item]));
            $table.append(`
                <tr>
                    <td colspan="2" class="title-input"><input class="title" type="text" value="${title}"></td>
                    <td colspan="2">${Math.round(result * 10000) / 100}%</td>
                </tr>
            `);
        });
        let total = total_prob(deck, draw, cards_py, pyodide.toPy(cases));
        $table.append(`
            <tr>
                <td colspan="2">전체 확률</td>
                <td colspan="2">${Math.round(total * 10000) / 100}%</td>
            </tr>
        `);
        share_data = [deck, draw, {...cards}, cases];
        $('button#share').show();
        $(this).html('계산하기');
    }
});

function tobase91(obj) {
    return base91.encode(
        pako.deflate(
            new TextEncoder().encode(
                JSON.stringify(obj)
            )
        )
    );
}

// 공유 (base64 사용)
$('body').on('click', 'button#share', function() {
    let share_code = tobase91(share_data);
    navigator.clipboard.writeText(share_code);
    alert('코드가 복사되었습니다.');
});

function atbase91(encode_str) {
    return JSON.parse(
        new TextDecoder().decode(
            pako.inflate(
                base91.decode(encode_str)
            )
        )
    );
}

// 로드 (클립보드 사용)
$('button#load').on('click', async function() {
    if(window.confirm('클립보드에서 코드를 불러옵니다.')) {
        try {
            let code = await navigator.clipboard.readText();
            code = code.replace(/\s+/g, '');
            let load_data = atbase91(code);

            $('input#deck').val(load_data[0]);
            $('input#draw').val(load_data[1]);

            $('div#card_list div.card').remove();
            $('button#add_card_list').click();
            Object.entries(load_data[2]).forEach(function([key, value]) {
                let card = $('div#card_list div.card').last();
                card.find('input.card_name').val(key);
                card.find('input.card_cnt').val(value);
                $('button#add_card_list').click();
            });
            $('button#sub_card_list').click();

            $('div#combo_list div.combo').remove();
            $('button#add_combo_list').click();
            load_data[3].forEach(function(item) {
                Object.entries(item).forEach(function([key, value]) {
                    let card = $('div.combo div.card').last();
                    card.find('select.card_name').val(key);
                    card.find('input.card_cnt').val(value);
                    $('button#add_combo').last().click();
                });
                $('button#sub_combo').last().click();
                $('button#add_combo_list').click();
            });
            $('button#sub_combo_list').click();

            $('button#calculate').click();
        } catch(e) {
            alert('올바르지 않은 코드입니다.');
        }
    }
});