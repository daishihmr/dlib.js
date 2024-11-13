export class SceneTree {
  static build (nodeSpec, scene) {
    const obj = new window.dailib[nodeSpec.className](...(nodeSpec.arguments || []))
    if (nodeSpec.properties) {
      Object.assign(obj, nodeSpec.properties)
    }
    if (scene) {
      scene.add(obj, nodeSpec.name)
    }
    if (nodeSpec.children) {
      nodeSpec.children.forEach((childSpec) => {
        const child = SceneTree.build(childSpec, scene)
        obj.transform.addChild(child.transform)
      })
    }
    return obj
  }
}
