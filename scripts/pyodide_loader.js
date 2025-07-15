var pyodide = null;

async function main() {
    pyodide = await loadPyodide();
    let moduleText = await (await fetch("scripts/calculate.py")).text();
    pyodide.FS.mkdir("/scripts");
    pyodide.FS.writeFile("/scripts/calculate.py", moduleText);
    pyodide.runPython(`
        import sys
        if "/scripts" not in sys.path:
            sys.path.append("/scripts")

        from calculate import *
    `);
    
    console.log(pyodide.runPython(`
        print('pyodide load.')
        sys.version
    `));
};

main();