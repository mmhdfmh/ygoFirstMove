$('#btn').on('click', function() {
    if(pyodide === null) return;
    $('body').append(`
        <p>${pyodide.runPython('f"{total_prob(40, 5, {\'A\': 3}, [{\'A\': 2}]):.2%}"')}</p>
    `)
});