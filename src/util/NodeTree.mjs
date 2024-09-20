export class NodeTree {
  static build (nodeSpec, scene) {
    const obj = new window.dlib[nodeSpec.className](...(nodeSpec.arguments || []))
    if (nodeSpec.properties) {
      Object.assign(obj, nodeSpec.properties)
    }
    if (scene) {
      scene.add(obj, nodeSpec.name)
    }
    if (nodeSpec.children) {
      nodeSpec.children.forEach((childSpec) => {
        const child = NodeTree.build(childSpec, scene)
        obj.transform.addChild(child.transform)
      })
    }
    return obj
  }
}
