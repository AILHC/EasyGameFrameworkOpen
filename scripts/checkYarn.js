if (!/yarn\.js$/.test(process.env.npm_execpath || '')) {
  console.warn(
    '\u001b[33mThis repository requires Yarn 1.x for scripts to work properly.\u001b[39m\n'
  )
  console.warn(
    '\u001b[33m这个仓库需要安装Yarn\u001b[39m\n'
  )
  console.log(`you can try again after install yarn : npm i yarn -g`);
  console.log(`你可以在安装yarn(npm i yarn -g)之后再尝试`)
  process.exit(1)
}
