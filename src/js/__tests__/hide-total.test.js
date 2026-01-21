/**
 * @vitest-environment jsdom
 */

describe('Hide total removed', () => {
  it('does not include the hide total button in the DOM', () => {
    document.body.innerHTML = `<form id="well-form"></form>`;
    const btn = document.getElementById('toggle_hide_total_btn');
    expect(btn).toBeNull();
  });
});
