let cards = {};
let share_data = '';

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

// 초동 카드 입력시 동기화
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
    share_code = '';

    if(deck < draw)
        alert('덱의 매수가 드로우할 카드보다 적습니다.');
    else if(cases.length == 0)
        alert('초동 조합을 입력해야합니다.');
    else {
        $(this).html('계산중...');
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
                    <td colspan="2">${title}</td>
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
        // share_data = [deck, draw, {...cards}, cases];
        // $table.after(`
        //     <button id="share">공유하기</button>
        // `);
        $(this).html('계산하기');
    }
});

// // 공유 (base64 사용)
// $('body').on('click', 'button#share', function() {
//     if(share_code != '') {
//         navigator.clipboard.writeText(share_code);
//         alert('코드가 복사되었습니다.');
//     }
// });

// // 로드 (클립보드 사용)
// $('button#load').on('click', function() {

// });