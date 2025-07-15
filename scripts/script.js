async function main() {
    let pyodide = await loadPyodide();
    // Pyodide is now ready to use...
    $('#test').html(pyodide.runPython(`
        import sys

        sys.version
    `))
};

main();