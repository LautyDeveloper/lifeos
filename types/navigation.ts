export type NavigationIconKey = string

export type NavigationItemData = {
  href: string
  label: string
  iconKey: NavigationIconKey
}

export type NavigationGroupData = {
  id: string
  items: NavigationItemData[]
}
