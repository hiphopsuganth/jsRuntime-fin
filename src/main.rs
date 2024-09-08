use deno_core::{
    error::AnyError, resolve_path, FsModuleLoader, JsRuntime, PollEventLoopOptions, RuntimeOptions,
};
use std::env;
use std::rc::Rc;


async fn run_js(file_path: &str, debug: bool) -> Result<(), AnyError> {
    let main_module = resolve_path(file_path, env::current_dir()?.as_path())?;
    println!("Resolved main module path: {:?}", main_module);
    let mut js_runtime = JsRuntime::new(RuntimeOptions {
        module_loader: Some(Rc::new(FsModuleLoader)),
        ..Default::default()
    });

    if debug {
        js_runtime.execute_script(
            "[runjs:set_debug.js]",
            "globalThis.DEBUG = true;",
        )?;
    } else {
        js_runtime.execute_script(
            "[runjs:set_debug.js]",
            "globalThis.DEBUG = false;",
        )?;
    }

    // Execute the runtime.js script
    let runtime_script = include_str!("../runtime.js");
    js_runtime.execute_script("[runjs:runtime.js]", runtime_script)
        .map_err(|e| AnyError::msg(format!("Failed to execute runtime.js: {}", e)))?;

    // Load and evaluate the main module
    let mod_id = js_runtime.load_main_es_module(&main_module).await?;
    let result = js_runtime.mod_evaluate(mod_id);
    js_runtime
        .run_event_loop(PollEventLoopOptions {
            wait_for_inspector: false,
            pump_v8_message_loop: false,
        })
        .await?;
    result.await
}

fn main() {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();

    let debug = true; 

    if let Err(error) = runtime.block_on(run_js("./example.js", debug)) {
        eprintln!("error: {}", error);
    }
}
