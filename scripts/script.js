$('#btn').on('click', function() {
    $('body').append(`
        <p>${pyodide.runPython('f"{calculate_firstmove_prob(40, 5, 3):.2%}"')}</p>
    `)
});