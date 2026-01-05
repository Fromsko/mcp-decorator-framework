/**
 * Keyword Graph - 关键词图谱索引
 *
 * 基于共现关系构建关键词网络，支持：
 * - 关键词权重计算（TF-IDF 变体）
 * - 边权重（共现频率）
 * - 图扩展检索（从种子词扩散）
 */

import type { KeywordNode, MemoryEntry, SearchResult } from "../types.js";

export class KeywordGraph {
  private nodes: Map<string, KeywordNode> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map(); // keyword -> entry ids

  constructor(initialGraph?: Map<string, KeywordNode>) {
    if (initialGraph) {
      this.nodes = initialGraph;
    }
  }

  /** 从记忆条目构建图谱 */
  buildFromEntries(entries: MemoryEntry[]): void {
    // 重置
    this.nodes.clear();
    this.invertedIndex.clear();

    // 统计词频
    const docFreq = new Map<string, number>(); // 文档频率
    const totalDocs = entries.length;

    for (const entry of entries) {
      const uniqueKeywords = new Set(entry.keywords);

      // 更新倒排索引
      for (const kw of Array.from(uniqueKeywords)) {
        if (!this.invertedIndex.has(kw)) {
          this.invertedIndex.set(kw, new Set());
        }
        this.invertedIndex.get(kw)!.add(entry.id);
        docFreq.set(kw, (docFreq.get(kw) || 0) + 1);
      }

      // 构建共现边
      const kwArray = Array.from(uniqueKeywords);
      for (let i = 0; i < kwArray.length; i++) {
        for (let j = i + 1; j < kwArray.length; j++) {
          this.addEdge(kwArray[i], kwArray[j]);
        }
      }
    }

    // 计算节点权重（IDF）
    for (const [keyword, node] of Array.from(this.nodes)) {
      const df = docFreq.get(keyword) || 1;
      node.weight = Math.log(totalDocs / df) + 1;
    }
  }

  /** 添加边（双向） */
  private addEdge(kw1: string, kw2: string): void {
    // 确保节点存在
    if (!this.nodes.has(kw1)) {
      this.nodes.set(kw1, { keyword: kw1, weight: 1, connections: new Map() });
    }
    if (!this.nodes.has(kw2)) {
      this.nodes.set(kw2, { keyword: kw2, weight: 1, connections: new Map() });
    }

    const node1 = this.nodes.get(kw1)!;
    const node2 = this.nodes.get(kw2)!;

    // 增加边权重
    node1.connections.set(kw2, (node1.connections.get(kw2) || 0) + 1);
    node2.connections.set(kw1, (node2.connections.get(kw1) || 0) + 1);
  }

  /** 增量更新：添加新条目 */
  addEntry(entry: MemoryEntry): void {
    const keywords = entry.keywords;

    for (const kw of keywords) {
      if (!this.invertedIndex.has(kw)) {
        this.invertedIndex.set(kw, new Set());
      }
      this.invertedIndex.get(kw)!.add(entry.id);

      if (!this.nodes.has(kw)) {
        this.nodes.set(kw, { keyword: kw, weight: 1, connections: new Map() });
      }
    }

    // 更新共现
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        this.addEdge(keywords[i], keywords[j]);
      }
    }
  }

  /** 增量更新：删除条目 */
  removeEntry(entry: MemoryEntry): void {
    for (const kw of entry.keywords) {
      this.invertedIndex.get(kw)?.delete(entry.id);
    }
    // 注：不删除节点和边，保持图谱稳定性
  }

  /**
   * 图扩展检索
   * 从种子关键词出发，通过图结构扩展相关词
   */
  expandQuery(
    seedKeywords: string[],
    maxDepth: number = 2,
    maxExpansion: number = 10
  ): Map<string, number> {
    const scores = new Map<string, number>();
    const visited = new Set<string>();

    // BFS 扩展
    let frontier = seedKeywords.filter((kw) => this.nodes.has(kw));
    let depth = 0;

    // 种子词得分最高
    for (const kw of frontier) {
      scores.set(kw, 1.0);
      visited.add(kw);
    }

    while (depth < maxDepth && frontier.length > 0) {
      const nextFrontier: string[] = [];
      const decayFactor = 1 / (depth + 2); // 距离衰减

      for (const kw of frontier) {
        const node = this.nodes.get(kw);
        if (!node) continue;

        // 按边权重排序邻居
        const neighbors = Array.from(node.connections.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, maxExpansion);

        for (const [neighbor, edgeWeight] of neighbors) {
          if (visited.has(neighbor)) continue;
          visited.add(neighbor);

          const neighborNode = this.nodes.get(neighbor);
          if (!neighborNode) continue;

          // 得分 = 边权重 * 节点权重 * 衰减
          const score = (edgeWeight / 10) * neighborNode.weight * decayFactor;
          scores.set(neighbor, score);
          nextFrontier.push(neighbor);
        }
      }

      frontier = nextFrontier;
      depth++;
    }

    return scores;
  }

  /**
   * 基于图谱的检索
   */
  search(
    query: string[],
    entries: MemoryEntry[],
    options: {
      maxResults?: number;
      minScore?: number;
      useExpansion?: boolean;
    } = {}
  ): SearchResult[] {
    const { maxResults = 20, minScore = 0.1, useExpansion = true } = options;

    // 扩展查询词
    const queryScores = useExpansion
      ? this.expandQuery(query)
      : new Map(query.map((q) => [q, 1.0]));

    // 计算每个条目的得分
    const results: SearchResult[] = [];

    for (const entry of entries) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const kw of entry.keywords) {
        const kwScore = queryScores.get(kw);
        if (kwScore) {
          score += kwScore;
          matchedKeywords.push(kw);
        }
      }

      if (score >= minScore && matchedKeywords.length > 0) {
        // 归一化得分
        score = score / Math.sqrt(entry.keywords.length);
        results.push({ entry, score, matchedKeywords });
      }
    }

    // 排序并截断
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }

  /** 获取相关关键词 */
  getRelatedKeywords(
    keyword: string,
    limit: number = 10
  ): Array<{ keyword: string; score: number }> {
    const node = this.nodes.get(keyword);
    if (!node) return [];

    return Array.from(node.connections.entries())
      .map(([kw, weight]) => ({
        keyword: kw,
        score: weight * (this.nodes.get(kw)?.weight || 1),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /** 获取热门关键词 */
  getTopKeywords(
    limit: number = 20
  ): Array<{ keyword: string; weight: number; connections: number }> {
    return Array.from(this.nodes.values())
      .map((node) => ({
        keyword: node.keyword,
        weight: node.weight,
        connections: node.connections.size,
      }))
      .sort((a, b) => b.weight * b.connections - a.weight * a.connections)
      .slice(0, limit);
  }

  /** 导出图谱 */
  export(): Map<string, KeywordNode> {
    return new Map(this.nodes);
  }

  /** 获取统计信息 */
  getStats(): { nodes: number; edges: number; avgConnections: number } {
    let totalEdges = 0;
    for (const node of Array.from(this.nodes.values())) {
      totalEdges += node.connections.size;
    }

    return {
      nodes: this.nodes.size,
      edges: totalEdges / 2, // 无向图
      avgConnections: this.nodes.size > 0 ? totalEdges / this.nodes.size : 0,
    };
  }
}
