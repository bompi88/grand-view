import React from 'react';

export default class CategoriesView extends React.Component {

  renderTag(item) {
    const { setCurrentCategory, getCurrentCategory, text } = this.props;

    let className = 'element disable-select';
    if (getCurrentCategory() === item.category) {
      className += ' selected';
    }

    return (
      <li
        className="category"
        key={item.category}
        style={{ marginBottom: '10px' }}
      >
        <span
          draggable="false"
          className={className}
          onClick={setCurrentCategory.bind(this, item.category)}
        >
          {item.category !== 'undefined' ? item.category : text.uncategorized } ({item.count || 0})
        </span>
      </li>
    );
  }

  renderTags(items) {
    return (
      <ul>
        { items.map((item) => {
          return this.renderTag(item);
        })}
      </ul>
    );
  }

  renderNoTags() {
    const { text } = this.props;
    return (
      <div>
        <em>{text.emptySet}</em>
      </div>
    );
  }

  render() {
    const { items } = this.props;
    return (
      <div className="tree structure disable-select">
        { items && items.length ? this.renderTags(items) : this.renderNoTags() }
      </div>
    );
  }
}
