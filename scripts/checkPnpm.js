console.log(`执行命令工具:${process.env.npm_execpath}`)
if (!/yarn\.js$/.test(process.env.npm_execpath || '')&&!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn(
    '\u001b[33mThis repository requires pnpm for scripts to work properly.\u001b[39m\n'
  )
  console.warn(
    '\u001b[33m这个仓库需要安装 pnpm \u001b[39m\n'
  )
  console.log(`you can try again after install pnpm : npm i pnpm -g`);
  console.log(`你可以在安装pnpm之后再尝试`)
  process.exit(1)
}
